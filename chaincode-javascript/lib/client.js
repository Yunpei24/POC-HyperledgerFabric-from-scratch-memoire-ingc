/*
 * SPDX-License-Identifier: Apache-2.0
 */

// Déclaration de la classe Client
class Client {
    constructor(ubi, firstName, lastName, dateOfBirth, gender, email, accountList, nationality, imageDocumentIdentification, isActive) {
        this.UBI = ubi;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.email = email;
        this.accountList = accountList;  // Tableau d'objets contenant accountNumber et bankName
        this.nationality = nationality;
        this.imageDocumentIdentification = imageDocumentIdentification;
        this.isActive = isActive;
        this.docType = 'client'; // Ajout du docType pour différencier les documents
    }
}

module.exports = Client;
