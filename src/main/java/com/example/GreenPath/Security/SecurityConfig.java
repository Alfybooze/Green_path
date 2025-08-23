package com.example.GreenPath.Security;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final DataSource dataSource;
    
    @Value("${app.security.remember-me.key}")
    private String rememberMeKey;
    
    @Value("${app.security.remember-me.token-validity-seconds}")
    private int rememberMeTokenValiditySeconds;

    public SecurityConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/", "/home", "/login", "/register", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // Remove in production
                
                // Role-based access
                .requestMatchers("/farmer/**").hasRole("FARMER")
                .requestMatchers("/herder/**").hasRole("HERDER")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                
                // WebSocket endpoints
                .requestMatchers("/ws/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Form login configuration
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/perform-login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler(authenticationSuccessHandler())
                .failureUrl("/login?error=true")
                .permitAll()
            )
            
            // Remember Me configuration
            .rememberMe(remember -> remember
                .key(rememberMeKey)
                .tokenRepository(persistentTokenRepository())
                .tokenValiditySeconds(rememberMeTokenValiditySeconds)
                .userDetailsService(userDetailsService()) // You'll need to implement this
                .rememberMeParameter("remember-me")
                .rememberMeCookieName("remember-me-cookie")
            )
            
            // Logout configuration
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .deleteCookies("JSESSIONID", "remember-me-cookie")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll()
            )
            
            // Session management
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .expiredUrl("/login?expired=true")
                .sessionRegistry(sessionRegistry())
            )
            
            // CSRF configuration
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/ws/**") // Disable CSRF for WebSocket
            )
            
            // Headers configuration
            .headers(headers -> headers
                .frameOptions().sameOrigin()  // Allow frames from same origin (for H2 console)
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                )
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl tokenRepository = new JdbcTokenRepositoryImpl();
        tokenRepository.setDataSource(dataSource);
        tokenRepository.setCreateTableOnStartup(true); // Set to false after first run
        return tokenRepository;
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    @Bean
    public org.springframework.security.core.session.SessionRegistry sessionRegistry() {
        return new org.springframework.security.core.session.SessionRegistryImpl();
    }

    // You'll need to implement this service
    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        // This should return your custom UserDetailsService implementation
        // that loads User entities from your database
        throw new UnsupportedOperationException("Implement CustomUserDetailsService");
    }

    // Custom success handler to redirect based on user type
   public static class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // Read the selected role from login form
        String chosenRole = request.getParameter("role");

        // Check if the user actually has that role
        boolean hasRole = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(chosenRole));

        String targetUrl;
        if (hasRole) {
            targetUrl = switch (chosenRole) {
                case "ROLE_FARMER" -> "/farmer/dashboard";
                case "ROLE_HERDER" -> "/herder/dashboard";
                case "ROLE_ADMIN" -> "/admin/dashboard";
                default -> "/dashboard";
            };
        } else {
            // Fallback if the chosen role isn't valid
            targetUrl = "/dashboard";
        }

        // Redirect
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

}
