package com.hoaxify.hoaxify.configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter{
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable();
		
		http.httpBasic();
		
		http
			.authorizeRequests().antMatchers(HttpMethod.POST, "/api/1.0/login").authenticated()
			.and()
			.authorizeRequests().anyRequest().permitAll();
	}

}
