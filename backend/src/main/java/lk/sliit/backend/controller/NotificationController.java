package lk.sliit.backend.controller;

import lk.sliit.backend.dto.notification.NotificationDto;
import lk.sliit.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> myNotifications() {
        return notificationService.myNotifications();
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(@PathVariable Long id) {
        return notificationService.markRead(id);
    }
}
