package com.res.server.backend.repository;

import com.res.server.backend.entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public  interface LibraryRepository extends JpaRepository<Library, UUID> {

}
