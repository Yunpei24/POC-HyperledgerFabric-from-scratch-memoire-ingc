/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const clientManagement = require('./lib/clientBank');

module.exports.ClientManagement = clientManagement;
module.exports.contracts = [clientManagement];
