package com.example.GreenPath;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class GreenPathApplication {

	public static void main(String[] args) {
		SpringApplication.run(GreenPathApplication.class, args);
	}
}
