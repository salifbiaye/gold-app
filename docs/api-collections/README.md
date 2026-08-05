# Collections API TRESORMONEY PI-SPI

## Fichiers

- `tresormoney-pispi.postman_collection.json` : collection Postman importable.
- `tresormoney-pispi.postman_environment.json` : environnement Postman avec variables.

Insomnia peut aussi importer une collection Postman.

## Ordre de test

1. Importer la collection et l'environnement dans Postman.
2. Renseigner les variables sensibles dans l'environnement :
   - `keycloak_base_url`
   - `keycloak_realm`
   - `keycloak_client_id`
   - `keycloak_client_secret`
   - `x_api_key`
3. Verifier les alias :
   - `tresor_alias` : alias TRESORMONEY / beneficiaire cote Tresor.
   - `client_alias` : alias du client externe / autre participant.
4. Lancer `0. Obtenir token Keycloak`.
5. Lancer `1. Paiement CASH-OUT - Initier`.
6. Lancer `2. Paiement CASH-OUT - Confirmer`.
7. Lancer `3. Demande de paiement CASH-IN - Initier`.
8. Si le CASH-IN retourne `error = -1`, tester `3b. Demande de paiement CASH-IN - Initier minimal`.
9. Lancer `4. Demande de paiement CASH-IN - Confirmer`.

## Notes

- Ne mets jamais de vrais secrets dans la collection.
- Les alias fournis sont ceux de la documentation. Remplace-les par des alias de test valides si l'environnement PI-SPI l'exige.
- En CASH-OUT, `payeurAlias = tresor_alias` et `payeAlias = client_alias`.
- En CASH-IN, `payeurAlias = client_alias` et `payeAlias = tresor_alias`.
- Le webhook est un exemple de payload a envoyer vers une URL que vous exposez.
