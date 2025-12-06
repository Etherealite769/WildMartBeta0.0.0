package com.ecommerce.WildMartV1.citccs.config;

import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            log.info("Processing request: {} {} with auth header: {}", 
                request.getMethod(), 
                request.getRequestURI(),
                authHeader != null ? "Bearer ***" : "null");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                if (token.isEmpty()) {
                    log.warn("Empty token received");
                    filterChain.doFilter(request, response);
                    return;
                }
                
                log.info("Found Bearer token, attempting to extract username");
                
                String email = jwtService.extractUsername(token);
                log.info("Extracted email from token: {}", email);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Look up the user
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        // Create authentication token with the actual User object as principal
                        UsernamePasswordAuthenticationToken authenticationToken = 
                            new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        log.info("JWT Token validated and authentication set for user: {} (ID: {})", email, user.getUserId());
                    } else {
                        log.warn("User not found for email: {}", email);
                    }
                } else {
                    log.warn("Email is null or authentication already exists. Email: {}, Auth exists: {}", 
                        email, SecurityContextHolder.getContext().getAuthentication() != null);
                }
            } else {
                log.info("No Bearer token found in request for: {}", request.getRequestURI());
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.error("JWT Token expired: {}", e.getMessage());
        } catch (io.jsonwebtoken.SignatureException e) {
            log.error("JWT Signature invalid: {}", e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("JWT Token malformed: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Cannot set user authentication: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}
