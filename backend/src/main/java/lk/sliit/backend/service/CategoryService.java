package lk.sliit.backend.service;

import lk.sliit.backend.dto.category.CategoryRequest;
import lk.sliit.backend.dto.category.CategoryResponse;
import lk.sliit.backend.entity.ComplaintCategory;
import lk.sliit.backend.exception.BadRequestException;
import lk.sliit.backend.exception.ResourceNotFoundException;
import lk.sliit.backend.repository.ComplaintCategoryRepository;
import lk.sliit.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final ComplaintCategoryRepository categoryRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(ComplaintCategory::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toDto).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) throw new BadRequestException("Category already exists.");
        ComplaintCategory category = ComplaintCategory.builder()
                .name(name)
                .description(clean(request.description()))
                .active(request.active() == null || request.active())
                .build();
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        ComplaintCategory category = getEntity(id);
        String name = request.name().trim();
        categoryRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new BadRequestException("Category already exists.");
        });
        category.setName(name);
        category.setDescription(clean(request.description()));
        if (request.active() != null) category.setActive(request.active());
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        ComplaintCategory category = getEntity(id);
        if (ticketRepository.countByCategoryId(id) > 0) {
            category.setActive(false);
            categoryRepository.save(category);
        } else {
            categoryRepository.delete(category);
        }
    }

    public ComplaintCategory findByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint category not found."));
    }

    private ComplaintCategory getEntity(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }

    private CategoryResponse toDto(ComplaintCategory c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.isActive());
    }

    private String clean(String s) { return s == null ? null : s.trim(); }
}
