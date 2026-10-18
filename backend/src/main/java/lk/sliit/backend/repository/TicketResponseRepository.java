package lk.sliit.backend.repository;

import lk.sliit.backend.entity.TicketResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketResponseRepository extends JpaRepository<TicketResponse, Long> {
    List<TicketResponse> findAllByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
