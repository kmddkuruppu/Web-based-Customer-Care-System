package lk.sliit.backend.repository;

import lk.sliit.backend.entity.InternalNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternalNoteRepository extends JpaRepository<InternalNote, Long> {
    List<InternalNote> findAllByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
