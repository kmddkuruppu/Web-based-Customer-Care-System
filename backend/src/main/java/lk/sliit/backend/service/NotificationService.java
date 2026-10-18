package lk.sliit.backend.service;

import lk.sliit.backend.dto.notification.NotificationDto;
import lk.sliit.backend.entity.Notification;
import lk.sliit.backend.entity.User;
import lk.sliit.backend.exception.ForbiddenException;
import lk.sliit.backend.exception.ResourceNotFoundException;
import lk.sliit.backend.repository.NotificationRepository;
import lk.sliit.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public void create(User user, String message) {
        if (user == null) return;
        notificationRepository.save(Notification.builder().user(user).message(message).readFlag(false).build());
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> myNotifications() {
        User me = currentUserService.get();
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(me.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public NotificationDto markRead(Long id) {
        User me = currentUserService.get();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        if (!n.getUser().getId().equals(me.getId())) throw new ForbiddenException("This notification does not belong to you.");
        n.setReadFlag(true);
        return toDto(notificationRepository.save(n));
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getMessage(), n.isReadFlag(), n.getCreatedAt());
    }
}
