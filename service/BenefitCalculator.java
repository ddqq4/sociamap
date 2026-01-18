package ru.socialmap.service;
import org.springframework.stereotype.Service;
import ru.socialmap.model.ServicePoint;
@Service
public class BenefitCalculator {
    public double calculateBenefitScore(ServicePoint point, double userLat, double userLon) {
        double distance = calculateDistance(userLat, userLon, point.getLatitude(), point.getLongitude());
        double averageDiscount = (point.getMinDiscount() + point.getMaxDiscount()) / 2.0;
        return averageDiscount - (distance * 0.1);
    }
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    public String getDistanceLabel(double distance) {
        if (distance < 1) {
            return Math.round(distance * 1000) + " м";
        } else {
            return String.format("%.1f км", distance);
        }
    }
    public String getBenefitLabel(double score) {
        if (score > 10) return "Отличная выгода!";
        if (score > 5) return "Хорошая выгода";
        if (score > 0) return "Средняя выгода";
        return "Низкая выгода";
    }
}
