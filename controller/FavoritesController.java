package ru.socialmap.controller;
import org.springframework.web.bind.annotation.*;
import ru.socialmap.model.Favorite;
import ru.socialmap.repository.FavoriteRepository;

import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/favorites")
@CrossOrigin
public class FavoritesController {
    private final FavoriteRepository favoriteRepository;
    public FavoritesController(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
    @PostMapping("/toggle")
    public Map<String, Object> toggleFavorite(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long pointId = request.get("pointId");
        Favorite existing = favoriteRepository.findByUserIdAndPointId(userId, pointId);
        Map<String, Object> response = new HashMap<>();
        if (existing != null) {
            favoriteRepository.delete(existing);
            response.put("message", "Удалено из избранного");
            response.put("added", false);
        } else {
            Favorite newFavorite = new Favorite(userId, pointId);
            favoriteRepository.save(newFavorite);
            response.put("message", "Добавлено в избранное");
            response.put("added", true);
        }
        return response;
    }
    @GetMapping
    public java.util.List<Long> getFavorites(@RequestParam Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(Favorite::getPointId)
                .toList();
    }
}