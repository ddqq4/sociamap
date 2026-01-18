package ru.socialmap.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, double[]> cache = new ConcurrentHashMap<>();

    public double[] geocode(String query) {
        // Проверяем кеш
        if (cache.containsKey(query)) {
            return cache.get(query);
        }

        try {
            // Добавляем Москву если не указано
            String searchQuery = query;
            if (!searchQuery.toLowerCase().contains("москва")) {
                searchQuery += ", Москва, Россия";
            }

            // Кодируем запрос
            String encodedQuery = URLEncoder.encode(searchQuery, StandardCharsets.UTF_8);

            // Делаем запрос с задержкой чтобы не превысить лимит
            Thread.sleep(100);

            String url = "https://nominatim.openstreetmap.org/search" +
                    "?format=json&limit=1&q=" + encodedQuery +
                    "&countrycodes=ru";

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response == null || response.isEmpty()) {
                System.out.println("⚠️ Не найдены координаты для: " + query);
                return null;
            }

            double lat = Double.parseDouble(response.get(0).get("lat").toString());
            double lon = Double.parseDouble(response.get(0).get("lon").toString());

            double[] result = new double[]{lat, lon};

            // Сохраняем в кеш
            cache.put(query, result);
            System.out.println("📍 Найдены координаты для '" + query + "': " + lat + ", " + lon);

            return result;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } catch (Exception e) {
            System.err.println("❌ Ошибка геокодирования '" + query + "': " + e.getMessage());
            return null;
        }
    }
}