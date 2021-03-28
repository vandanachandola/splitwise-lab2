import React from 'react';
import { Container, Form, Row } from 'react-bootstrap';
import { ErrorOutline } from '@material-ui/icons';

const FormErrors = ({ formErrors, currentField }) => (
  <div className="formErrors">
    {Object.keys(formErrors).map((fieldName, i) => {
      if (currentField === fieldName && formErrors[fieldName].length > 0) {
        return (
          <div>
            <Container>
              <Row>
                <span>
                  <ErrorOutline
                    style={{
                      fontSize: '18px',
                      color: '#D8000C',
                      marginRight: '0.2rem',
                    }}
                  />
                </span>
                <span>
                  <Form.Text
                    key={`err-${i}`}
                    style={{ color: '#D8000C', fontWeight: 500 }}
                  >
                    {formErrors[fieldName]}
                  </Form.Text>
                </span>
              </Row>
            </Container>
          </div>
        );
      }
      return '';
    })}
  </div>
);

export default FormErrors;
