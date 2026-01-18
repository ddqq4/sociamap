package ru.socialmap.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.socialmap.model.User;
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}