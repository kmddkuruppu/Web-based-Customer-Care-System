package lk.sliit.backend.service;

import lk.sliit.backend.dto.category.CategoryResponse;
import lk.sliit.backend.dto.ticket.*;
import lk.sliit.backend.entity.*;
import lk.sliit.backend.enums.*;
import lk.sliit.backend.exception.BadRequestException;
import lk.sliit.backend.exception.ForbiddenException;
import lk.sliit.backend.exception.ResourceNotFoundException;
import lk.sliit.backend.repository.*;
import lk.sliit.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final TicketResponseRepository responseRepository;
    private final InternalNoteRepository noteRepository;
    private final TicketHistoryRepository historyRepository;
    private final CustomerFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    @Transactional
    public TicketDto create(String title, String categoryName, String description, TicketPriority priority, MultipartFile attachment) {
        User customer = currentUserService.get();
        if (customer.getRole() != UserRole.CUSTOMER) throw new ForbiddenException("Only customers can submit complaints.");
        if (title == null || title.trim().length() < 5) throw new BadRequestException("Title must be at least 5 characters.");
        if (description == null || description.trim().length() < 10) throw new BadRequestException("Description must be at least 10 characters.");

        ComplaintCategory category = categoryService.findByName(categoryName);
        if (!category.isActive()) throw new BadRequestException("Selected category is inactive.");

        Ticket ticket = Ticket.builder()
                .title(title.trim())
                .description(description.trim())
                .customer(customer)
                .category(category)
                .priority(priority == null ? TicketPriority.MEDIUM : priority)
                .status(TicketStatus.OPEN)
                .build();

        if (attachment != null && !attachment.isEmpty()) {
            try {
                ticket.setAttachmentName(attachment.getOriginalFilename());
                ticket.setAttachmentContentType(attachment.getContentType());
                ticket.setAttachmentData(attachment.getBytes());
            } catch (IOException e) {
                throw new BadRequestException("Unable to read attachment.");
            }
        }

        ticket = ticketRepository.save(ticket);
        ticket.setTicketNumber("TKT-" + ticket.getCreatedAt().getYear() + "-" + String.format("%06d", ticket.getId()));
        ticket = ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_CREATED", null, TicketStatus.OPEN.name(), "Complaint submitted", customer);
        notificationService.create(customer, "Your complaint " + ticket.getTicketNumber() + " was submitted successfully.");
        return toDto(ticket, true, customer);
    }

    @Transactional(readOnly = true)
    public List<TicketDto> myTickets() {
        User me = currentUserService.get();
        if (me.getRole() != UserRole.CUSTOMER) throw new ForbiddenException("Only customers can use this endpoint.");
        return ticketRepository.findAllByCustomerIdOrderByCreatedAtDesc(me.getId()).stream()
                .map(t -> toDto(t, false, me)).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> list(Boolean assignedToMe, String search, TicketStatus status, String category, TicketPriority priority) {
        User me = currentUserService.get();
        List<Ticket> base;

        if (me.getRole() == UserRole.CUSTOMER_CARE_AGENT) {
            base = ticketRepository.findAllByAssignedAgentIdOrderByCreatedAtDesc(me.getId());
        } else if (me.getRole() == UserRole.SENIOR_CUSTOMER_CARE_AGENT) {
            if (Boolean.TRUE.equals(assignedToMe)) {
                base = ticketRepository.findAllByAssignedAgentIdOrderByCreatedAtDesc(me.getId());
            } else {
                base = ticketRepository.findAllByStatusOrderByCreatedAtDesc(TicketStatus.ESCALATED);
            }
        } else if (me.getRole() == UserRole.SUPERVISOR) {
            base = Boolean.TRUE.equals(assignedToMe)
                    ? ticketRepository.findAllByAssignedAgentIdOrderByCreatedAtDesc(me.getId())
                    : ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            throw new ForbiddenException("You do not have permission to list tickets.");
        }

        Stream<Ticket> stream = base.stream();
        if (status != null) stream = stream.filter(t -> t.getStatus() == status);
        if (priority != null) stream = stream.filter(t -> t.getPriority() == priority);
        if (category != null && !category.isBlank()) stream = stream.filter(t -> t.getCategory().getName().equalsIgnoreCase(category));
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            stream = stream.filter(t ->
                    String.valueOf(t.getId()).equals(q) ||
                    Optional.ofNullable(t.getTicketNumber()).orElse("").toLowerCase().contains(q) ||
                    t.getTitle().toLowerCase().contains(q));
        }
        return stream.map(t -> toDto(t, false, me)).toList();
    }

    @Transactional(readOnly = true)
    public TicketDto get(Long id) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkCanView(ticket, me);
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto update(Long id, TicketUpdateRequest request) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkStaffCanManage(ticket, me);
        if (isFinished(ticket)) throw new BadRequestException("Finished tickets cannot be edited.");

        if (request.title() != null) ticket.setTitle(request.title().trim());
        if (request.description() != null) ticket.setDescription(request.description().trim());
        if (request.category() != null && !request.category().isBlank()) ticket.setCategory(categoryService.findByName(request.category()));
        if (request.priority() != null) ticket.setPriority(request.priority());
        ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_UPDATED", null, null, "Ticket details updated", me);
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto updateStatus(Long id, TicketStatus newStatus) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkStaffCanManage(ticket, me);
        if (!EnumSet.of(TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_CUSTOMER).contains(newStatus)) {
            throw new BadRequestException("Use resolve, close, escalate or archive actions for that status.");
        }
        TicketStatus previous = ticket.getStatus();
        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);
        addHistory(ticket, "STATUS_CHANGED", previous.name(), newStatus.name(), null, me);
        notificationService.create(ticket.getCustomer(), ticket.getTicketNumber() + " status changed to " + newStatus.name().replace('_', ' ') + ".");
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto assign(Long id, Long agentId) {
        User me = currentUserService.get();
        requireRole(me, UserRole.SUPERVISOR);
        Ticket ticket = getEntity(id);
        if (isFinished(ticket)) throw new BadRequestException("Finished tickets cannot be assigned.");
        User agent = userRepository.findById(agentId).orElseThrow(() -> new ResourceNotFoundException("Agent not found."));
        if (!agent.isEnabled() || !EnumSet.of(UserRole.CUSTOMER_CARE_AGENT, UserRole.SENIOR_CUSTOMER_CARE_AGENT).contains(agent.getRole())) {
            throw new BadRequestException("Selected user is not an active support agent.");
        }
        String previous = ticket.getAssignedAgent() == null ? "Unassigned" : ticket.getAssignedAgent().getFullName();
        ticket.setAssignedAgent(agent);
        if (ticket.getStatus() == TicketStatus.OPEN) ticket.setStatus(TicketStatus.ASSIGNED);
        ticketRepository.save(ticket);
        addHistory(ticket, "AGENT_ASSIGNED", previous, agent.getFullName(), null, me);
        notificationService.create(agent, "Ticket " + ticket.getTicketNumber() + " has been assigned to you.");
        notificationService.create(ticket.getCustomer(), "Your ticket " + ticket.getTicketNumber() + " has been assigned to a support agent.");
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto setPriority(Long id, TicketPriority priority) {
        User me = currentUserService.get();
        requireRole(me, UserRole.SUPERVISOR);
        Ticket ticket = getEntity(id);
        TicketPriority previous = ticket.getPriority();
        ticket.setPriority(priority);
        ticketRepository.save(ticket);
        addHistory(ticket, "PRIORITY_CHANGED", previous.name(), priority.name(), null, me);
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto escalate(Long id, String reason) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        if (!EnumSet.of(UserRole.CUSTOMER_CARE_AGENT, UserRole.SUPERVISOR).contains(me.getRole())) {
            throw new ForbiddenException("Only an agent or supervisor can escalate tickets.");
        }
        checkStaffCanManage(ticket, me);
        if (isFinished(ticket)) throw new BadRequestException("Finished tickets cannot be escalated.");
        TicketStatus previous = ticket.getStatus();
        ticket.setStatus(TicketStatus.ESCALATED);
        ticket.setEscalationReason(reason.trim());
        ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_ESCALATED", previous.name(), TicketStatus.ESCALATED.name(), reason.trim(), me);
        notificationService.create(ticket.getCustomer(), "Your ticket " + ticket.getTicketNumber() + " has been escalated for further review.");
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto resolve(Long id, String resolution) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkStaffCanManage(ticket, me);
        if (EnumSet.of(TicketStatus.CLOSED, TicketStatus.ARCHIVED).contains(ticket.getStatus())) {
            throw new BadRequestException("Closed or archived tickets cannot be resolved again.");
        }
        TicketStatus previous = ticket.getStatus();
        ticket.setResolution(resolution.trim());
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_RESOLVED", previous.name(), TicketStatus.RESOLVED.name(), resolution.trim(), me);
        notificationService.create(ticket.getCustomer(), "Your ticket " + ticket.getTicketNumber() + " has been resolved.");
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto close(Long id) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        if (ticket.getStatus() != TicketStatus.RESOLVED) throw new BadRequestException("Only resolved tickets can be closed.");
        if (me.getRole() == UserRole.CUSTOMER) {
            if (!ticket.getCustomer().getId().equals(me.getId())) throw new ForbiddenException("This ticket does not belong to you.");
        } else {
            checkStaffCanManage(ticket, me);
        }
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_CLOSED", TicketStatus.RESOLVED.name(), TicketStatus.CLOSED.name(), null, me);
        notificationService.create(ticket.getCustomer(), "Ticket " + ticket.getTicketNumber() + " has been closed.");
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketDto archive(Long id) {
        User me = currentUserService.get();
        requireRole(me, UserRole.SUPERVISOR);
        Ticket ticket = getEntity(id);
        if (ticket.getStatus() != TicketStatus.CLOSED) throw new BadRequestException("Only closed tickets can be archived.");
        ticket.setStatus(TicketStatus.ARCHIVED);
        ticket.setArchived(true);
        ticketRepository.save(ticket);
        addHistory(ticket, "TICKET_ARCHIVED", TicketStatus.CLOSED.name(), TicketStatus.ARCHIVED.name(), null, me);
        return toDto(ticket, true, me);
    }

    @Transactional
    public TicketResponseDto addResponse(Long id, String message) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkCanView(ticket, me);
        if (EnumSet.of(TicketStatus.CLOSED, TicketStatus.ARCHIVED).contains(ticket.getStatus())) {
            throw new BadRequestException("Replies cannot be added to a closed ticket.");
        }
        TicketResponse response = responseRepository.save(TicketResponse.builder().ticket(ticket).sender(me).message(message.trim()).build());
        addHistory(ticket, "RESPONSE_ADDED", null, null, "Response added by " + me.getFullName(), me);
        if (me.getRole() == UserRole.CUSTOMER) {
            if (ticket.getAssignedAgent() != null) notificationService.create(ticket.getAssignedAgent(), "Customer replied to " + ticket.getTicketNumber() + ".");
        } else {
            notificationService.create(ticket.getCustomer(), "A support response was added to " + ticket.getTicketNumber() + ".");
        }
        return toResponseDto(response);
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDto> responses(Long id) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkCanView(ticket, me);
        return responseRepository.findAllByTicketIdOrderByCreatedAtAsc(id).stream().map(this::toResponseDto).toList();
    }

    @Transactional
    public InternalNoteDto addNote(Long id, String note) {
        User me = currentUserService.get();
        if (!EnumSet.of(UserRole.SENIOR_CUSTOMER_CARE_AGENT, UserRole.SUPERVISOR).contains(me.getRole())) {
            throw new ForbiddenException("Only senior agents and supervisors can add internal notes.");
        }
        Ticket ticket = getEntity(id);
        checkStaffCanManage(ticket, me);
        InternalNote saved = noteRepository.save(InternalNote.builder().ticket(ticket).createdBy(me).note(note.trim()).build());
        addHistory(ticket, "INTERNAL_NOTE_ADDED", null, null, "Internal note added", me);
        return toNoteDto(saved);
    }

    @Transactional
    public FeedbackDto addFeedback(Long id, FeedbackRequest request) {
        User me = currentUserService.get();
        if (me.getRole() != UserRole.CUSTOMER) throw new ForbiddenException("Only customers can submit feedback.");
        Ticket ticket = getEntity(id);
        if (!ticket.getCustomer().getId().equals(me.getId())) throw new ForbiddenException("This ticket does not belong to you.");
        if (!EnumSet.of(TicketStatus.RESOLVED, TicketStatus.CLOSED).contains(ticket.getStatus())) {
            throw new BadRequestException("Feedback can only be submitted after resolution.");
        }
        if (feedbackRepository.existsByTicketId(id)) throw new BadRequestException("Feedback has already been submitted for this ticket.");
        CustomerFeedback feedback = feedbackRepository.save(CustomerFeedback.builder()
                .ticket(ticket).customer(me).rating(request.rating()).comment(request.comment().trim()).build());
        return toFeedbackDto(feedback);
    }

    @Transactional(readOnly = true)
    public Ticket getAttachmentTicket(Long id) {
        User me = currentUserService.get();
        Ticket ticket = getEntity(id);
        checkCanView(ticket, me);
        if (ticket.getAttachmentData() == null || ticket.getAttachmentData().length == 0) throw new ResourceNotFoundException("No attachment found.");
        return ticket;
    }

    private Ticket getEntity(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));
    }

    private void checkCanView(Ticket ticket, User me) {
        switch (me.getRole()) {
            case CUSTOMER -> {
                if (!ticket.getCustomer().getId().equals(me.getId())) throw new ForbiddenException("This ticket does not belong to you.");
            }
            case CUSTOMER_CARE_AGENT -> {
                if (ticket.getAssignedAgent() == null || !ticket.getAssignedAgent().getId().equals(me.getId())) throw new ForbiddenException("This ticket is not assigned to you.");
            }
            case SENIOR_CUSTOMER_CARE_AGENT -> {
                boolean assigned = ticket.getAssignedAgent() != null && ticket.getAssignedAgent().getId().equals(me.getId());
                if (!assigned && ticket.getStatus() != TicketStatus.ESCALATED) throw new ForbiddenException("You may only access escalated or assigned tickets.");
            }
            case SUPERVISOR -> { }
            default -> throw new ForbiddenException("You do not have permission to view tickets.");
        }
    }

    private void checkStaffCanManage(Ticket ticket, User me) {
        if (me.getRole() == UserRole.CUSTOMER_CARE_AGENT) {
            if (ticket.getAssignedAgent() == null || !ticket.getAssignedAgent().getId().equals(me.getId())) throw new ForbiddenException("This ticket is not assigned to you.");
            return;
        }
        if (me.getRole() == UserRole.SENIOR_CUSTOMER_CARE_AGENT) {
            boolean assigned = ticket.getAssignedAgent() != null && ticket.getAssignedAgent().getId().equals(me.getId());
            if (!assigned && ticket.getStatus() != TicketStatus.ESCALATED) throw new ForbiddenException("You may only manage escalated or assigned tickets.");
            return;
        }
        if (me.getRole() != UserRole.SUPERVISOR) throw new ForbiddenException("You cannot manage this ticket.");
    }

    private boolean isFinished(Ticket t) {
        return EnumSet.of(TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.ARCHIVED).contains(t.getStatus());
    }

    private void requireRole(User user, UserRole role) {
        if (user.getRole() != role) throw new ForbiddenException("This action requires role " + role + ".");
    }

    private void addHistory(Ticket ticket, String action, String previous, String next, String details, User user) {
        historyRepository.save(TicketHistory.builder().ticket(ticket).action(action).previousValue(previous).newValue(next).details(details).performedBy(user).build());
    }

    private UserSummaryDto userSummary(User u) {
        return u == null ? null : new UserSummaryDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole());
    }

    private TicketResponseDto toResponseDto(TicketResponse r) {
        return new TicketResponseDto(r.getId(), userSummary(r.getSender()), r.getSender().getRole(), r.getMessage(), r.getCreatedAt());
    }

    private InternalNoteDto toNoteDto(InternalNote n) {
        return new InternalNoteDto(n.getId(), n.getNote(), userSummary(n.getCreatedBy()), n.getCreatedAt());
    }

    private TicketHistoryDto toHistoryDto(TicketHistory h) {
        return new TicketHistoryDto(h.getId(), h.getAction(), h.getPreviousValue(), h.getNewValue(), h.getDetails(), userSummary(h.getPerformedBy()), h.getCreatedAt());
    }

    private FeedbackDto toFeedbackDto(CustomerFeedback f) {
        return new FeedbackDto(f.getId(), f.getRating(), f.getComment(), f.getCreatedAt());
    }

    private TicketDto toDto(Ticket t, boolean details, User viewer) {
        List<TicketResponseDto> responses = details
                ? responseRepository.findAllByTicketIdOrderByCreatedAtAsc(t.getId()).stream().map(this::toResponseDto).toList()
                : List.of();
        List<InternalNoteDto> notes = details && viewer.getRole() != UserRole.CUSTOMER
                ? noteRepository.findAllByTicketIdOrderByCreatedAtAsc(t.getId()).stream().map(this::toNoteDto).toList()
                : List.of();
        List<TicketHistoryDto> history = details
                ? historyRepository.findAllByTicketIdOrderByCreatedAtAsc(t.getId()).stream().map(this::toHistoryDto).toList()
                : List.of();
        FeedbackDto feedback = details ? feedbackRepository.findByTicketId(t.getId()).map(this::toFeedbackDto).orElse(null) : null;

        return new TicketDto(
                t.getId(), t.getTicketNumber(), t.getTitle(), t.getDescription(),
                new CategoryResponse(t.getCategory().getId(), t.getCategory().getName(), t.getCategory().getDescription(), t.getCategory().isActive()),
                t.getPriority(), t.getStatus(), userSummary(t.getCustomer()), userSummary(t.getAssignedAgent()),
                t.getResolution(), t.getEscalationReason(), t.getAttachmentName(),
                t.getCreatedAt(), t.getUpdatedAt(), t.getResolvedAt(), t.getClosedAt(), t.isArchived(),
                responses, notes, history, feedback
        );
    }
}
