package lk.sliit.backend.entity;

import jakarta.persistence.*;
import lk.sliit.backend.enums.TicketPriority;
import lk.sliit.backend.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets", uniqueConstraints = @UniqueConstraint(columnNames = "ticket_number"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", unique = true, length = 40)
    private String ticketNumber;

    @Column(nullable = false, length = 180)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String escalationReason;

    @Column(length = 255)
    private String attachmentName;

    @Column(length = 120)
    private String attachmentContentType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] attachmentData;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = TicketStatus.OPEN;
        if (priority == null) priority = TicketPriority.MEDIUM;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
