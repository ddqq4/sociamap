package ru.socialmap.controller;
import org.springframework.web.bind.annotation.*;
import ru.socialmap.model.ServicePoint;
import ru.socialmap.repository.ServicePointRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = "*")
public class PointsController {
    private final ServicePointRepository servicePointRepository;
    public PointsController(ServicePointRepository servicePointRepository) {
        this.servicePointRepository = servicePointRepository;
    }
    @GetMapping("/best-offers")
    public List<Map<String, Object>> getBestOffers(
            @RequestParam String category,
            @RequestParam double userLat,
            @RequestParam double userLon) {
        List<ServicePoint> points = servicePointRepository.findByCategoryContainingIgnoreCase(category);
        List<Map<String, Object>> offers = new ArrayList<>();
        for (ServicePoint p : points) {
            if (p.getLatitude() == 0 && p.getLongitude() == 0) { // если координаты не заданы
                continue;
            }
            double distance = calculateDistance(userLat, userLon, p.getLatitude(), p.getLongitude());
            double discount = p.getMaxDiscount();
            double benefit = discount - distance * 1.5;
            Map<String, Object> offer = new HashMap<>();
            offer.put("id", p.getId());
            offer.put("name", p.getName());
            offer.put("address", p.getAddress());
            offer.put("discount", discount);
            offer.put("distance", Math.round(distance * 10.0) / 10.0);
            offer.put("benefit", Math.round(benefit * 10.0) / 10.0);
            offer.put("latitude", p.getLatitude());
            offer.put("longitude", p.getLongitude());
            offer.put("workingHours", p.getWorkingHours() != null ? p.getWorkingHours() : "Не указано");
            offer.put("phone", "Не указано"); // если нет поля phone
            offer.put("website", "Не указан");
            offers.add(offer);
        }
        offers.sort((a, b) -> Double.compare((Double) b.get("benefit"), (Double) a.get("benefit")));
        return offers.stream().limit(3).collect(Collectors.toList());
    }
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

