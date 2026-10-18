package lk.sliit.backend.service;

import lk.sliit.backend.dto.user.UserRequest;
import lk.sliit.backend.dto.user.UserResponse;
import lk.sliit.backend.entity.User;
import lk.sliit.backend.enums.UserRole;
import lk.sliit.backend.exception.BadRequestException;
import lk.sliit.backend.exception.ResourceNotFoundException;
import lk.sliit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email is already in use.");
        }
        if (request.role() == null || request.role() == UserRole.CUSTOMER) {
            throw new BadRequestException("Admin staff creation requires a staff role.");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .contactNumber(clean(request.contactNumber()))
                .address(clean(request.address()))
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true)
                .build();
        return toDto(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = getEntity(id);
        String email = request.email().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new BadRequestException("Email is already in use.");
        });

        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setContactNumber(clean(request.contactNumber()));
        if (request.address() != null) user.setAddress(clean(request.address()));
        if (request.role() != null) user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return toDto(userRepository.save(user));
    }

    @Transactional
    public UserResponse setStatus(Long id, boolean enabled) {
        User user = getEntity(id);
        user.setEnabled(enabled);
        return toDto(userRepository.save(user));
    }

    public User getEntity(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    public UserResponse toDto(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getContactNumber(), user.getAddress(), user.getRole(), user.isEnabled());
    }

    private String clean(String s) {
        return s == null ? null : s.trim();
    }
}
