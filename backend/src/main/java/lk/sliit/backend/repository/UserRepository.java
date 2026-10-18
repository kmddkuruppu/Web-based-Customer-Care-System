package lk.sliit.backend.repository;

import lk.sliit.backend.entity.User;
import lk.sliit.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findAllByRoleInAndEnabledTrue(List<UserRole> roles);
}
