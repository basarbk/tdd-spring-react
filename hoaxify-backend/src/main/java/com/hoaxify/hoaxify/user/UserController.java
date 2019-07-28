package com.hoaxify.hoaxify.user;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hoaxify.hoaxify.error.ApiError;
import com.hoaxify.hoaxify.shared.CurrentUser;
import com.hoaxify.hoaxify.shared.GenericResponse;
import com.hoaxify.hoaxify.user.vm.UserVM;

@RestController
@RequestMapping("/api/1.0")
public class UserController {

	@Autowired
	UserService userService;
	
	@PostMapping("/users")
	GenericResponse createUser(@Valid @RequestBody User user) {
		userService.save(user);
		return new GenericResponse("User saved");
	}
	
	@GetMapping("/users")
	Page<UserVM> getUsers(@CurrentUser User loggedInUser, Pageable page) {
		return userService.getUsers(loggedInUser, page).map(UserVM::new);
	}
	
	@GetMapping("/users/{username}")
	UserVM getUserByName(@PathVariable String username) {
		User user = userService.getByUsername(username);
		return new UserVM(user);
	}
	
	@ExceptionHandler({MethodArgumentNotValidException.class})
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	ApiError handleValidationException(MethodArgumentNotValidException exception, HttpServletRequest request) {
		ApiError apiError = new ApiError(400, "Validation error", request.getServletPath());
		
		BindingResult result = exception.getBindingResult();
		
		Map<String, String> validationErrors = new HashMap<>();
		
		for(FieldError fieldError: result.getFieldErrors()) {
			validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
		}
		apiError.setValidationErrors(validationErrors);
		
		return apiError;
	}
}
