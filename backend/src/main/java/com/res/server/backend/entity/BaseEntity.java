package com.res.server.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Getter
@MappedSuperclass // this indicates that this class is a base class for other entities
// and its properties will be inherited by subclasses
// but this class itself will not be mapped to a database table
@EntityListeners(AuditingEntityListener.class) // this enables auditing for entities that extend this base class
public class BaseEntity {
    @CreatedDate
    @Column(updatable = false) // this indicates that this column should not be updated after creation
    private Instant createdAt;
    @LastModifiedDate // this indicates that this field should be updated with the current timestamp whenever the entity is updated
    private Instant updatedAt;
}
