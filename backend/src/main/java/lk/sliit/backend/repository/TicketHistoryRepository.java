package lk.sliit.backend.repository;

import lk.sliit.backend.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findAllByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
