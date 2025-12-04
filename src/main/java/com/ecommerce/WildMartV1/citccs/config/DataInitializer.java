package com.ecommerce.WildMartV1.citccs.config;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if categories already exist
        if (categoryRepository.count() == 0) {
            // Create default categories
            List<String> categoryNames = Arrays.asList(
                    "electronics",
                    "clothing",
                    "books",
                    "home",
                    "accessories",
                    "sports",
                    "other");

            for (String categoryName : categoryNames) {
                Category category = new Category();
                category.setCategoryName(categoryName);
                category.setActive(true);
                categoryRepository.save(category);
                System.out.println("Created category: " + categoryName);
            }
        } else {
            System.out.println("Categories already exist, skipping initialization");
        }
    }
}