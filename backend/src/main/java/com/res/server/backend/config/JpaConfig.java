package com.res.server.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
// this enables JPA Auditing features like @CreatedDate, @LastModifiedDate
// means this class is used to configure JPA related settings like auditing
// eg: automatically populating createdAt and updatedAt fields in entities
public class JpaConfig {

}
