package com.volunteerhub.VolunteerHub.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.*;

@Service
public class JwtService {

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    private SignedJWT parseToken(String token) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        MACVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        if (!signedJWT.verify(verifier)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return signedJWT;
    }

    public String extractUsername(String token) {
        try {
            return parseToken(token).getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Set<String> extractRoles(String token) {
        try {
            Object rolesObj = parseToken(token).getJWTClaimsSet().getClaim("roles");
            if (rolesObj instanceof List<?>) {
                return new HashSet<>((List<String>) rolesObj);
            }
            return Collections.emptySet();
        } catch (Exception e) {
            return Collections.emptySet();
        }
    }

    public boolean isExpired(String token) {
        try {
            Date exp = parseToken(token).getJWTClaimsSet().getExpirationTime();
            return exp.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}