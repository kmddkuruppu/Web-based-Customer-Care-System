package lk.sliit.backend.repository;

import lk.sliit.backend.entity.Ticket;
import lk.sliit.backend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Ticket> findAllByAssignedAgentIdOrderByCreatedAtDesc(Long agentId);
    List<Ticket> findAllByStatusOrderByCreatedAtDesc(TicketStatus status);
    long countByCategoryId(Long categoryId);
}
