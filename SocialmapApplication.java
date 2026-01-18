package ru.socialmap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
@SpringBootApplication
@EntityScan("ru.socialmap.model")
@EnableJpaRepositories("ru.socialmap.repository")
public class SocialmapApplication {
	public static void main(String[] args) {
		SpringApplication.run(SocialmapApplication.class, args);
		System.out.println("Социальная карта Москвы: http://localhost:8080");
	}
}
