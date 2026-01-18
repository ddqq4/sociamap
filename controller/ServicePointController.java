package ru.socialmap.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import ru.socialmap.model.ServicePoint;
import ru.socialmap.repository.ServicePointRepository;
import java.util.List;
@RestController
@RequestMapping("/api/points")
@CrossOrigin
public class ServicePointController {
    private final ServicePointRepository repository;
    public ServicePointController(ServicePointRepository repository) {
        this.repository = repository;
    }
    @GetMapping("/all")
    public Page<ServicePoint> getAll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAll(pageable);
    }
    @GetMapping
    public Page<ServicePoint> getFiltered(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String holderCategory,
            @RequestParam(required = false) String admArea,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findByFilters(name, category, holderCategory, admArea, district, pageable);
    }
    @GetMapping("/categories")
    public List<String> getCategories() {
        return repository.findDistinctCategory();
    }
    @GetMapping("/holderCategories")
    public List<String> getHolderCategories() {
        return repository.findDistinctCategoriesOfHolders();
    }
    @GetMapping("/admAreas")
    public List<String> getAdmAreas() {
        return repository.findDistinctAdmArea();
    }
    @GetMapping("/districts")
    public List<String> getDistricts() {
        return repository.findDistinctDistrict();
    }
}
