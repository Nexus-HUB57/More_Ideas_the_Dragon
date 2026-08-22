## Todo

- [ ] Analyze current transaction failure
- [ ] Debug script verification error
- [ ] Fix transaction construction and signing
  - [x] Implement manual byte-by-byte transaction construction for P2PKH.
  - [ ] Review Bitcoin transaction structure for P2PKH inputs and SIGHASH_ALL signing process.
  - [ ] Correct `scriptSig` and `hash_to_sign` calculation.
- [x] Validate P2PKH transaction construction step-by-step.
- [x] Ensure correct mainnet broadcast URLs are used
- [ ] Test and broadcast corrected transaction
- [ ] Report results to user

