# CodeBazaar ER Diagram Description

## Entities

1. **User**
   - Can be buyer, creator, or admin.
2. **Project**
   - Uploaded by a creator.
3. **Purchase**
   - Created when a buyer successfully verifies Razorpay payment.
4. **Review**
   - Added by a buyer for a purchased project.

## Relationships

- One `User` uploads many `Project` records.
- One `User` purchases many `Project` records through `Purchase`.
- One `Project` can have many `Purchase` records.
- One `User` writes many `Review` records.
- One `Project` can have many `Review` records.

## Cardinality Summary

- `User 1:N Project`
- `User 1:N Purchase`
- `Project 1:N Purchase`
- `User 1:N Review`
- `Project 1:N Review`
