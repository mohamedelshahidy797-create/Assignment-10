export const findOne = async ({
    model,
    filter = {},
    select = "",
    options = {}
} = {}) => {
    const doc = model.findOne(filter)
if (options.select) {
        doc.select(options.select)
    }
    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.lean) {
        doc.lean()
    }

    return await doc.exec()
}

export const findAll = async ({
    model,
    filter = {},
    select = "",
    options = {}
} = {}) => {
    const doc = model.find(filter).select(select)

    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.lean) {
        doc.lean()
    }

    return await doc.exec()
}

export const create = async ({
    model,
    data
} = {}) => {
    return await model.create(data)
}

export const updateOne = async ({
    model,
    filter = {},
    data = {},
    options = {}
} = {}) => {
    return await model.updateOne(filter, data, options).exec()
}

export const deleteOne = async ({
    model,
    filter = {}
} = {}) => {
    return await model.deleteOne(filter).exec()
}

export const findById = async ({
    model,
    id,
    select = "",
    options = {}
} = {}) => {
    const doc = model.findById(id)

    // Supports both direct 'select' param (like findAll) or 'options.select' (like findOne)
    if (select) {
        doc.select(select)
    } else if (options.select) {
        doc.select(options.select)
    }

    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.lean) {
        doc.lean()
    }

    return await doc.exec()
}

export const findByIdAndUpdate = async ({
    model,
    id,
    data = {},
    select = "",
    options = {}
} = {}) => {
    // We merge { new: true } to return the updated document by default, 
    // but allow the user to override it via the options object.
    const queryOptions = { new: true, runValidators: true, ...options };
    
    const doc = model.findByIdAndUpdate(id, data, queryOptions);

    // Supports both direct 'select' param or 'options.select'
    if (select) {
        doc.select(select);
    } else if (options.select) {
        doc.select(options.select);
    }

    if (options.populate) {
        doc.populate(options.populate);
    }

    if (options.lean) {
        doc.lean();
    }

    return await doc.exec();
}