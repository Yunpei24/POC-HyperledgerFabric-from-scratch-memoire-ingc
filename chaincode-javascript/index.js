/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const clientManager = require('./lib/clientManager');
module.exports.ClientManager = clientManager;
module.exports.contracts = [clientManager];