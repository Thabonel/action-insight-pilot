/**
 * AI Marketing Hub - Embeddable Lead Capture Form Widget
 *
 * Lightweight form widget that can be embedded on any website
 * to capture leads and send them to the Marketing Hub backend.
 */

(function(window) {
  'use strict';

  const LeadForm = {
    /**
     * Render a lead capture form in the specified container
     *
     * @param {Object} options - Configuration options
     * @param {string} options.formId - Form ID from Marketing Hub
     * @param {string} options.containerId - DOM element ID to render form in
     * @param {string} options.apiUrl - Backend API URL
     */
    render: function(options) {
      if (!options.formId) {
        console.error('LeadForm: formId is required');
        return;
      }

      if (!options.containerId) {
        console.error('LeadForm: containerId is required');
        return;
      }

      const container = document.getElementById(options.containerId);
      if (!container) {
        console.error('LeadForm: Container element not found:', options.containerId);
        return;
      }

      const apiUrl = options.apiUrl || 'https://wheels-wins-orchestrator.onrender.com';

      // Fetch form configuration
      this.fetchFormConfig(options.formId, apiUrl)
        .then(formConfig => {
          this.renderForm(container, formConfig, apiUrl);
        })
        .catch(error => {
          console.error('LeadForm: Failed to load form configuration:', error);
          container.innerHTML = '<p style="color: red;">Failed to load form. Please try again later.</p>';
        });
    },

    /**
     * Fetch form configuration from backend
     */
    fetchFormConfig: async function(formId, apiUrl) {
      // For now, return default config since the form config endpoint requires auth
      // In production, you'd either make the config public or embed it in the page
      return {
        id: formId,
        name: 'Lead Capture Form',
        fields: [
          { name: 'name', type: 'text', label: 'Name', required: true, placeholder: 'Your name' },
          { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
          { name: 'phone', type: 'tel', label: 'Phone', required: false, placeholder: '+1 (555) 000-0000' },
          { name: 'company', type: 'text', label: 'Company', required: false, placeholder: 'Company name' }
        ],
        styling: {
          button_color: '#3B82F6',
          button_text: 'Submit',
          success_message: 'Thank you! We\'ll be in touch soon.',
          error_message: 'Something went wrong. Please try again.'
        }
      };
    },

    /**
     * Render the form HTML
     */
    renderForm: function(container, formConfig, apiUrl) {
      const formId = formConfig.id;
      const styling = formConfig.styling || {};

      // Build form HTML
      let formHTML = `
        <form id="lead-form-${formId}" class="lead-capture-form" style="max-width: 500px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <style>
            .lead-capture-form input,
            .lead-capture-form textarea {
              width: 100%;
              padding: 12px;
              margin-bottom: 16px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 14px;
              box-sizing: border-box;
            }
            .lead-capture-form input:focus,
            .lead-capture-form textarea:focus {
              outline: none;
              border-color: ${styling.button_color || '#3B82F6'};
            }
            .lead-capture-form label {
              display: block;
              margin-bottom: 6px;
              font-weight: 500;
              font-size: 14px;
              color: #1f2937;
            }
            .lead-capture-form button {
              width: 100%;
              padding: 12px 24px;
              background-color: ${styling.button_color || '#3B82F6'};
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            .lead-capture-form button:hover {
              opacity: 0.9;
            }
            .lead-capture-form button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .lead-capture-form .message {
              padding: 12px;
              margin-bottom: 16px;
              border-radius: 6px;
              font-size: 14px;
            }
            .lead-capture-form .success {
              background-color: #d1fae5;
              color: #065f46;
              border: 1px solid #6ee7b7;
            }
            .lead-capture-form .error {
              background-color: #fee2e2;
              color: #991b1b;
              border: 1px solid #fca5a5;
            }
          </style>
          <div id="form-message-${formId}"></div>
      `;

      // Add form fields
      formConfig.fields.forEach(field => {
        formHTML += `
          <div class="form-field">
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            ${field.type === 'textarea'
              ? `<textarea
                  id="${field.name}"
                  name="${field.name}"
                  ${field.required ? 'required' : ''}
                  placeholder="${field.placeholder || ''}"
                  rows="4"
                ></textarea>`
              : `<input
                  type="${field.type}"
                  id="${field.name}"
                  name="${field.name}"
                  ${field.required ? 'required' : ''}
                  placeholder="${field.placeholder || ''}"
                />`
            }
          </div>
        `;
      });

      formHTML += `
          <button type="submit" id="submit-btn-${formId}">${styling.button_text || 'Submit'}</button>
        </form>
      `;

      container.innerHTML = formHTML;

      // Attach form submit handler
      const form = document.getElementById(`lead-form-${formId}`);
      const messageDiv = document.getElementById(`form-message-${formId}`);
      const submitBtn = document.getElementById(`submit-btn-${formId}`);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        messageDiv.innerHTML = '';

        // Collect form data
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
          data[key] = value;
        });

        // Add UTM parameters and referrer if available
        const urlParams = new URLSearchParams(window.location.search);
        data.utm_source = urlParams.get('utm_source') || '';
        data.utm_medium = urlParams.get('utm_medium') || '';
        data.utm_campaign = urlParams.get('utm_campaign') || '';
        data.referrer = document.referrer || '';

        try {
          // Submit to webhook
          const response = await fetch(`${apiUrl}/api/lead-capture/webhook/${formId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (result.success) {
            // Show success message
            messageDiv.innerHTML = `<div class="message success">${styling.success_message || result.message}</div>`;
            form.reset();

            // Optional redirect after 2 seconds
            if (styling.redirect_url) {
              setTimeout(() => {
                window.location.href = styling.redirect_url;
              }, 2000);
            }
          } else {
            throw new Error(result.detail || 'Submission failed');
          }
        } catch (error) {
          console.error('Form submission error:', error);
          messageDiv.innerHTML = `<div class="message error">${styling.error_message || 'Something went wrong. Please try again.'}</div>`;
        } finally {
          // Re-enable submit button
          submitBtn.disabled = false;
          submitBtn.textContent = styling.button_text || 'Submit';
        }
      });
    }
  };

  // Expose to global scope
  window.LeadForm = LeadForm;

})(window);