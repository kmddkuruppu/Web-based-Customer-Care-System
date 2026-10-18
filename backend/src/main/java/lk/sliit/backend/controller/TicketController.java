package lk.sliit.backend.controller;

import jakarta.validation.Valid;
import lk.sliit.backend.dto.ticket.*;
import lk.sliit.backend.entity.Ticket;
import lk.sliit.backend.enums.TicketPriority;
import lk.sliit.backend.enums.TicketStatus;
import lk.sliit.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TicketDto> create(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam(defaultValue = "MEDIUM") TicketPriority priority,
            @RequestParam(required = false) MultipartFile attachment) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.create(title, category, description, priority, attachment));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<TicketDto> myTickets() {
        return ticketService.myTickets();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER_CARE_AGENT','SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public List<TicketDto> list(
            @RequestParam(required = false) Boolean assignedToMe,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) TicketPriority priority) {
        return ticketService.list(assignedToMe, search, status, category, priority);
    }

    @GetMapping("/{id}")
    public TicketDto get(@PathVariable Long id) {
        return ticketService.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER_CARE_AGENT','SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public TicketDto update(@PathVariable Long id, @Valid @RequestBody TicketUpdateRequest request) {
        return ticketService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CUSTOMER_CARE_AGENT','SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public TicketDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return ticketService.updateStatus(id, request.status());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public TicketDto assign(@PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        return ticketService.assign(id, request.agentId());
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public TicketDto priority(@PathVariable Long id, @Valid @RequestBody PriorityRequest request) {
        return ticketService.setPriority(id, request.priority());
    }

    @PatchMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public TicketDto escalate(@PathVariable Long id, @Valid @RequestBody EscalationRequest request) {
        return ticketService.escalate(id, request.reason());
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('CUSTOMER_CARE_AGENT','SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public TicketDto resolve(@PathVariable Long id, @Valid @RequestBody ResolutionRequest request) {
        return ticketService.resolve(id, request.resolution());
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('CUSTOMER','CUSTOMER_CARE_AGENT','SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public TicketDto close(@PathVariable Long id) {
        return ticketService.close(id);
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public TicketDto archive(@PathVariable Long id) {
        return ticketService.archive(id);
    }

    @PostMapping("/{id}/responses")
    public ResponseEntity<TicketResponseDto> addResponse(@PathVariable Long id, @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addResponse(id, request.message()));
    }

    @GetMapping("/{id}/responses")
    public List<TicketResponseDto> responses(@PathVariable Long id) {
        return ticketService.responses(id);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('SENIOR_CUSTOMER_CARE_AGENT','SUPERVISOR')")
    public ResponseEntity<InternalNoteDto> addNote(@PathVariable Long id, @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addNote(id, request.note()));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackDto> feedback(@PathVariable Long id, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addFeedback(id, request));
    }

    @GetMapping("/{id}/attachment")
    public ResponseEntity<byte[]> attachment(@PathVariable Long id) {
        Ticket ticket = ticketService.getAttachmentTicket(id);
        MediaType type;
        try {
            type = ticket.getAttachmentContentType() == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(ticket.getAttachmentContentType());
        } catch (InvalidMediaTypeException ex) {
            type = MediaType.APPLICATION_OCTET_STREAM;
        }
        String filename = ticket.getAttachmentName() == null ? "attachment" : ticket.getAttachmentName();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(type)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(ticket.getAttachmentData());
    }
}
