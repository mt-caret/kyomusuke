module App exposing (..)

import Html exposing (Html, Attribute, div, text, input, p, button, program)
import Html.Attributes exposing (type_, style, value, size)
import Html.Events exposing (onInput, onClick)
import Task

-- MODEL


type alias Model =
    { number : Int
    }


init : ( Model, Cmd Msg )
init =
    ( Model 0, Cmd.none )



-- MESSAGES


type Msg
    = NoOp



-- VIEW


view : Model -> Html Msg
view model =
    div []
      [ p [] [ text "Hello, World!" ]
      ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- MAIN


main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
