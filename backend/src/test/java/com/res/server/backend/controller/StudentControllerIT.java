package com.res.server.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerIT {

    @Autowired
    MockMvc mockMvc;

    @Test
    void getStudents_withoutAuth_shouldFail() throws Exception {

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }
}