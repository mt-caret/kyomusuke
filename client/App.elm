module App exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Task
import Http
import Dict

import Api exposing (VerdictData, UserData, Verdict, populateVerdictData, extractUsers)

-- MODEL

type alias Model =
    { page : Page
    , data : VerdictData
    , users : List String
    }



type Page
  = Table
  | About


send : Cmd Msg
send = Http.send LoadData (Http.get "/stats" Api.apiDecoder)


init : ( Model, Cmd Msg )
init =
    ( Model Table Dict.empty [], send )


-- MESSAGES


type Msg
    = NoOp
    | PageTransition Page
    | LoadData (Result Http.Error (List UserData))



-- VIEW


view : Model -> Html Msg
view model =
    div [ id "app" ]
        [ navbar
        , div [ class "container" ] [ content model ]
        ]


navbar : Html Msg
navbar =
    nav [ class "navbar navbar-toggleable-xl navbar-light bg-faded" ]
        [ div [ class "container" ]
            [ a
                [ class "navbar-brand", href "#", onClick (PageTransition Table) ]
                [ text "kyomusuke" ]
            , ul [ class "navbar-nav" ]
                [ li
                    [ class "nav-item active", onClick (PageTransition About) ]
                    [ a [ class "nav-link", href "#about" ]
                        [ text "about" ]
                    ]
                ]
            ]
        ]


content : Model -> Html Msg
content model =
    let
        acToTd n = td [] [ text (toString n) ]
        enumUsers date =
            tr []
            ((th [ scope "row" ] [ text (Api.dateToString date) ]) ::
              List.map (Api.queryVerdict model.data date >> .ac >> acToTd) model.users)
        range = Api.dateRange Api.startDate Api.endDate
    in
        table [ class "table table-bordered table-sm" ]
            [ thead []
                [ tr []
                    ((th [] [ text "date" ]) ::
                    List.map (\x -> th [] [ text x ]) model.users)
                ]
            , tbody [] (List.map enumUsers range)
            ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )
        PageTransition newPage ->
            ( { model | page = newPage }, Cmd.none )
        LoadData (Ok newData) ->
            ( { model | data = populateVerdictData newData, users = extractUsers newData }, Cmd.none )
        LoadData (Err _) ->
            Debug.crash "API ERROR"



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
