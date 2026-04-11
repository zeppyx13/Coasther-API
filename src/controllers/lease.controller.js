const { ok, fail } = require("../utils/response");
const leaseService = require("../services/lease.service");

async function list(req, res) {
  try {
    const result = await leaseService.listLeases(req.query);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function detail(req, res) {
  try {
    const result = await leaseService.getLeaseDetail(Number(req.params.id));
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function create(req, res) {
  try {
    const result = await leaseService.createLease(req.body);
    return ok(res, result, "Lease created", 201);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function update(req, res) {
  try {
    const result = await leaseService.updateLease(
      Number(req.params.id),
      req.body,
    );
    return ok(res, result, "Lease updated", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function remove(req, res) {
  try {
    const result = await leaseService.deleteLease(Number(req.params.id));
    return ok(res, result, "Lease deleted", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

module.exports = { list, detail, create, update, remove };
