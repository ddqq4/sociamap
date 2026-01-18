package ru.socialmap.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.socialmap.model.Favorite;
import java.util.List;
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Favorite findByUserIdAndPointId(Long userId, Long pointId);
    void deleteByUserIdAndPointId(Long userId, Long pointId);
}
