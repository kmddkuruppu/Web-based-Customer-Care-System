package lk.sliit.backend.repository;

import lk.sliit.backend.entity.CustomerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, Long> {
    Optional<CustomerFeedback> findByTicketId(Long ticketId);
    boolean existsByTicketId(Long ticketId);
}
