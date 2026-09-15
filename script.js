// =====================================================
// SUBMIT MONETIZATION APPLICATION
// =====================================================

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        "#submitMonetizationApplication"
      );

    if (!button) return;


    const emailInput =
      document.getElementById(
        "monetizationEmail"
      );

    const documentInput =
      document.getElementById(
        "verificationDocument"
      );

    const status =
      document.getElementById(
        "applicationStatus"
      );

    const email =
      emailInput?.value.trim();


    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------

    if (!email || !email.includes("@")) {

      alert("Valid email enter karo.");

      return;

    }


    if (
      !documentInput ||
      !documentInput.files ||
      !documentInput.files.length
    ) {

      alert(
        "Verification document select karo."
      );

      return;

    }


    const file =
      documentInput.files[0];


    // ---------------------------------------------
    // FILE TYPE
    // ---------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];


    if (
      file.type &&
      !allowedTypes.includes(file.type)
    ) {

      alert(
        "Sirf JPG, PNG, WEBP ya PDF file upload kar sakte ho."
      );

      return;

    }


    // ---------------------------------------------
    // FILE SIZE
    // ---------------------------------------------

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      alert(
        "Document maximum 10 MB ka ho sakta hai."
      );

      return;

    }


    // ---------------------------------------------
    // CURRENT USER
    // ---------------------------------------------

    const user =
      await getCurrentUser();


    if (!user) {

      alert(
        "Application submit karne ke liye login karo."
      );

      return;

    }


    // ---------------------------------------------
    // ELIGIBILITY
    // ---------------------------------------------

    const views =
      getMyTotalViews();

    const watchHours =
      getMyTotalWatchMinutes() / 60;

    const subscribers =
      getMySubscriberCount();


    if (
      views < 1000 ||
      watchHours < 4000 ||
      subscribers < 1000
    ) {

      alert(
        "Aap abhi monetization ke liye eligible nahi hain."
      );

      return;

    }


    button.disabled = true;

    button.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Checking...';


    try {

      // -------------------------------------------
      // CHECK EXISTING APPLICATION
      // -------------------------------------------

      const {
        data: existing,
        error: existingError
      } =
        await supabaseClient
          .from("monetization_applications")
          .select(
            "id,status,document_path"
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          )
          .limit(1);


      if (existingError) {

        throw existingError;

      }


      if (
        existing &&
        existing.length > 0
      ) {

        const oldApplication =
          existing[0];


        if (status) {

          status.style.display =
            "block";

          status.textContent =
            "ℹ️ Application already submitted. Status: " +
            oldApplication.status;

        }


        button.innerHTML =
          '<i class="fas fa-check"></i> Already Submitted';


        return;

      }


      // -------------------------------------------
      // SAFE FILE NAME
      // -------------------------------------------

      const safeName =
        file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "-"
        );


      // -------------------------------------------
      // PRIVATE DOCUMENT PATH
      // -------------------------------------------

      const documentPath =
        user.id +
        "/" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 10) +
        "-" +
        safeName;


      // -------------------------------------------
      // UPLOAD DOCUMENT
      // -------------------------------------------

      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Uploading Document...';


      const {
        error: uploadError
      } =
        await supabaseClient
          .storage
          .from(
            "verification-documents"
          )
          .upload(
            documentPath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                "application/octet-stream"
            }
          );


      if (uploadError) {

        throw uploadError;

      }


      console.log(
        "✅ Verification document uploaded."
      );


      // -------------------------------------------
      // INSERT APPLICATION
      // -------------------------------------------

      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';


      const {
        data,
        error
      } =
        await supabaseClient
          .from(
            "monetization_applications"
          )
          .insert({
            user_id:
              user.id,

            email:
              email,

            status:
              "pending",

            document_path:
              documentPath
          })
          .select()
          .single();


      if (error) {

        // Remove uploaded document
        await supabaseClient
          .storage
          .from(
            "verification-documents"
          )
          .remove([
            documentPath
          ]);

        throw error;

      }


      console.log(
        "✅ Monetization application:",
        data
      );


      // -------------------------------------------
      // SUCCESS
      // -------------------------------------------

      if (status) {

        status.style.display =
          "block";

        status.textContent =
          "✅ Application submitted successfully! Admin review ka wait karein.";

      }


      button.innerHTML =
        '<i class="fas fa-check"></i> Application Submitted';


    } catch (error) {

      console.error(
        "Monetization application error:",
        error
      );


      alert(
        "Application submit nahi hui: " +
        error.message
      );


      button.disabled =
        false;


      button.innerHTML =
        '<i class="fas fa-paper-plane"></i> Submit Application';

    }

  }
);