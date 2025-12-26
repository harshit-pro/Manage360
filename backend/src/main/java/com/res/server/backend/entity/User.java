package com.res.server.backend.entity;

import com.res.server.backend.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    // make foreign key to library
    @ManyToOne
    @JoinColumn(name = "library_id")
    private Library library;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING) // store enum as string in db
    private UserRole role;

    private boolean enabled = true;
}
