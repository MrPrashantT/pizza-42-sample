import React, { useState } from "react";
import { Button, Alert, Card, Row, Col, CardImg, CardBody } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import pizzaData from "../utils/pizzaData";

export const ExternalApiComponent = () => {
  const { apiOrigin, audience } = getConfig();


  console.log('API ORIGIN:', apiOrigin);

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async (pizzaName) => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiOrigin}/api/order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pizzaType: pizzaName
        })
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {

      console.log('error:', error);
      setState({
        ...state,
        showResult: true,
        error: error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const _buildPizzaItems = () => {
    return pizzaData.map(pizza => (
      <Col sm="4" key={pizza.id} className="mb-10">
        <Card>
          <CardImg top height="300px" src={pizza.img} alt="Card image cap" />
          <CardBody>
            <h4>{pizza.name}</h4>
            <p>{pizza.description}</p>
            <p>${pizza.price}</p>
            <Button
              color="primary"
              className="mt-5"
              onClick={() => callApi(pizza.name)}
              disabled={!user.email_verified}
            >
              Order {pizza.name} pizza!
            </Button>
          </CardBody>
        </Card>
      </Col>
    ));
  }
  

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

      <h1>Order Pizza</h1>

      {!user.email_verified && (
        <Alert color="warning">
          <p>
            You can't order pizza yet because your email address is not verified. Please click on the link in the verification email that was sent to your email address.
          </p>

        </Alert>
      )}

      <Row>
        {/* {_buildPizzaItems()} */}

        {pizzaData.map(pizza => (
      <Col sm="4" key={pizza.id} className="mb-10">
        <Card>
          <CardImg top height="300px" src={pizza.img} alt="Card image cap" />
          <CardBody>
            <h4>{pizza.name}</h4>
            <p>{pizza.description}</p>
            <p>${pizza.price}</p>
            <Button
              color="primary"
              className="mt-5"
              onClick={() => {callApi(pizza.name)}}
              disabled={!user.email_verified}
            >
              Order {pizza.name} pizza!
            </Button>
          </CardBody>
        </Card>
      </Col>
    ))}
      </Row>






      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
