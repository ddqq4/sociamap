package ru.socialmap.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.socialmap.model.ServicePoint;

import java.util.List;
public interface ServicePointRepository extends JpaRepository<ServicePoint, Long> {
    @Query("SELECT s FROM ServicePoint s WHERE " +
            "(:name IS NULL OR s.name LIKE %:name%) AND " +
            "(:category IS NULL OR s.category LIKE %:category%) AND " +
            "(:holderCategory IS NULL OR s.categoriesOfHolders LIKE %:holderCategory%) AND " +
            "(:admArea IS NULL OR s.admArea LIKE %:admArea%) AND " +
            "(:district IS NULL OR s.district LIKE %:district%)")
    Page<ServicePoint> findByFilters(String name, String category, String holderCategory, String admArea, String district, Pageable pageable);
    @Query("SELECT DISTINCT s.category FROM ServicePoint s WHERE s.category IS NOT NULL ORDER BY s.category")
    List<String> findDistinctCategory();
    @Query("SELECT DISTINCT s.categoriesOfHolders FROM ServicePoint s WHERE s.categoriesOfHolders IS NOT NULL ORDER BY s.categoriesOfHolders")
    List<String> findDistinctCategoriesOfHolders();
    @Query("SELECT DISTINCT s.admArea FROM ServicePoint s WHERE s.admArea IS NOT NULL ORDER BY s.admArea")
    List<String> findDistinctAdmArea();
    @Query("SELECT DISTINCT s.district FROM ServicePoint s WHERE s.district IS NOT NULL ORDER BY s.district")
    List<String> findDistinctDistrict();
    List<ServicePoint> findByCategoryContainingIgnoreCase(String category);
}