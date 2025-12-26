package com.res.server.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "libraries")
@Getter
@Setter
public class Library {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String address;
    private String city;
    private Integer totalSeats;

    @Column(name = "reg_prefix")
    private String regPrefix;

    @Column(name = "next_reg_seq")
    private Integer nextRegSeq = 1;
}

// set code  when library is created
//Library library = new Library();
//library.setName(request.getName());
//        library.setAddress(request.getAddress());
//        library.setCity(request.getCity());
//        library.setTotalSeats(request.getTotalSeats());
//
//        library.setRegPrefix(PrefixUtil.generate(request.getName()));
//        library.setNextRegSeq(1);
//
//libraryRepository.save(library);
//