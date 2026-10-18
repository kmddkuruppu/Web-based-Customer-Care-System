package lk.sliit.backend.config;

import lk.sliit.backend.entity.ComplaintCategory;
import lk.sliit.backend.entity.User;
import lk.sliit.backend.enums.UserRole;
import lk.sliit.backend.repository.ComplaintCategoryRepository;
import lk.sliit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUser("System Admin", "admin@care.com", "0700000001", UserRole.ADMIN);
        createUser("Care Agent", "agent@care.com", "0700000002", UserRole.CUSTOMER_CARE_AGENT);
        createUser("Senior Agent", "senior@care.com", "0700000003", UserRole.SENIOR_CUSTOMER_CARE_AGENT);
        createUser("Support Supervisor", "supervisor@care.com", "0700000004", UserRole.SUPERVISOR);
        createUser("Service Manager", "manager@care.com", "0700000005", UserRole.MANAGER);
        createUser("Demo Customer", "customer@care.com", "0700000006", UserRole.CUSTOMER);

        createCategory("Delivery Issue", "Problems related to delivery or shipment");
        createCategory("Payment Issue", "Payment, billing, refund or transaction problems");
        createCategory("Product Issue", "Product defects, damage or incorrect items");
        createCategory("Technical Issue", "Technical or system-related support requests");
        createCategory("General Inquiry", "General customer questions and requests");
    }

    private void createUser(String name, String email, String phone, UserRole role) {
        if (userRepository.existsByEmailIgnoreCase(email)) return;
        userRepository.save(User.builder()
                .fullName(name)
                .email(email)
                .contactNumber(phone)
                .address("Demo Address")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(role)
                .enabled(true)
                .build());
    }

    private void createCategory(String name, String description) {
        if (categoryRepository.existsByNameIgnoreCase(name)) return;
        categoryRepository.save(ComplaintCategory.builder().name(name).description(description).active(true).build());
    }
}
