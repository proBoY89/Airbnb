const Listing = require("../models/listing");
const fetch = require("node-fetch");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exits");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;
    const { listing } = req.body;

    const geoResponse = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(
        listing.location
      )}.json?key=qgSfmfsJxIwbRYcJQOoN`
    );
    const geoData = await geoResponse.json();

    if (!geoData.features.length) {
      req.flash("error", "Invalid location. Please enter a valid place name.");
      return res.redirect("/listings/new");
    }

    const coordinates = geoData.features[0].geometry.coordinates;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
      type: "Point",
      coordinates: coordinates,
    };

    console.log(coordinates);
    await newListing.save();
    console.log("saved");
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  } catch (e) {
    console.error("Geocoding or Listing creation failed:", e);
    req.flash("error", "Something went wrong. Try again.");
    res.redirect("/listings/new");
  }
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exits");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteList = await Listing.findByIdAndDelete(id);
  console.log(deleteList);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};
