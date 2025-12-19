package com.cityconnect.smart_interventions.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class StorageService {

    private final Path root = Paths.get("uploads");

    public StorageService() throws IOException {
        if (!Files.exists(root)) Files.createDirectory(root);
    }

    public String store(MultipartFile file, String prefix) {
        try {
            String ext = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            
            String filename = prefix + "_" + System.currentTimeMillis() + ext;

            Files.copy(file.getInputStream(), root.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);

            return filename;

        } catch (Exception e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier");
        }
    }
}
