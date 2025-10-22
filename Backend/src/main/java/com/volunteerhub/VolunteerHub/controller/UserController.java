package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.entity.User;
import com.volunteerhub.VolunteerHub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllMovies(){
        return new ResponseEntity<List<User>>(userService.allUsers(), HttpStatus.OK);
    }

}
