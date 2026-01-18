package ru.socialmap.controller;
import org.springframework.web.bind.annotation.*;
import ru.socialmap.service.GeocodingService;
@RestController
@RequestMapping("/api/geocode")
@CrossOrigin
public class GeocodingController {
    private final GeocodingService service;
    public GeocodingController(GeocodingService service) {
        this.service = service;
    }
    @GetMapping
    public double[] geocode(@RequestParam String query) {
        return service.geocode(query);
    }
}

