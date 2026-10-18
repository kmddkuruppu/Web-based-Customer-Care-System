package lk.sliit.backend.repository;

import lk.sliit.backend.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {
    Optional<ComplaintCategory> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
